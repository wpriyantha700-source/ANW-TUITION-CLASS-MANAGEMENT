import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    institute: JSON.parse(localStorage.getItem('anw_current_institute')) || null,
  }),
  actions: {
    async fetchSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      this.user = session?.user || null

      if (this.user) {
        // Always try to fetch freshest institute data for the current user
        let { data: institute } = await supabase
          .from('institutes')
          .select('*')
          .eq('owner_id', this.user.id)
          .maybeSingle()

        if (institute) {
          this.setInstitute(institute)
        } else {
          // If no institute exists for this user, create a default one
          // This handles users created before the new registration flow
          const name = this.user.user_metadata?.full_name || this.user.email.split('@')[0]
          const slug =
            name.toLowerCase().replace(/[^a-z0-9]/g, '-') +
            '-' +
            Math.random().toString(36).substr(2, 4)

          const { data: newInst, error: createError } = await supabase
            .from('institutes')
            .insert([
              {
                name: `${name}'s Tuition Center`,
                slug: slug,
                owner_id: this.user.id,
              },
            ])
            .select()
            .single()

          if (createError) {
            console.error('Failed to auto-create institute:', createError)
            // Fallback to global default ONLY if creation fails
            this.setInstitute({
              id: '00000000-0000-0000-0000-000000000000',
              name: 'Default Institute',
            })
          } else {
            this.setInstitute(newInst)
          }
        }
      }
    },

    setInstitute(institute) {
      this.institute = institute
      localStorage.setItem('anw_current_institute', JSON.stringify(institute))
    },
    async updateInstitute(updatedData) {
      if (!this.institute?.id) return

      const { data, error } = await supabase
        .from('institutes')
        .update(updatedData)
        .eq('id', this.institute.id)
        .select()
        .single()

      if (error) throw error

      if (data) {
        this.setInstitute(data)
      }
    },
    async uploadAvatar(file) {
      console.log('Starting avatar upload...', file)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // sanitize file extension
      const fileExt = file.name.split('.').pop().toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        // Fallback or just allow it, but good to know
        console.warn('Unknown file extension:', fileExt)
      }

      const filePath = `${user.id}.${fileExt}`
      console.log('Uploading to path:', filePath)

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type, // Explicitly set content type
        })

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError)
        throw new Error(`Storage Error: ${uploadError.message}`)
      }

      console.log('Upload successful:', uploadData)

      // Get URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const finalUrl = `${publicUrl}?t=${Date.now()}`
      console.log('Generated Public URL:', finalUrl)

      // Update metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: finalUrl },
      })

      if (updateError) {
        console.error('Supabase auth update error:', updateError)
        throw new Error(`Auth Update Error: ${updateError.message}`)
      }

      // Update local state immediately
      if (this.user && this.user.user_metadata) {
        this.user.user_metadata.avatar_url = finalUrl
        // If we got a fresh user object back, we could also do:
        // this.user = updatedUser
      }

      return finalUrl
    },
    async uploadInstituteLogo(file) {
      if (!this.institute?.id) throw new Error('Institute not loaded')

      const fileExt = file.name.split('.').pop().toLowerCase()
      const filePath = `logos/${this.institute.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const finalUrl = `${publicUrl}?t=${Date.now()}`

      await this.updateInstitute({ logo_url: finalUrl })
      return finalUrl
    },
    async renewLicense(newKey) {
      if (!this.institute?.id) throw new Error('Institute not loaded')

      const { data, error } = await supabase.rpc('renew_institute_license', {
        inst_id: this.institute.id,
        new_key: newKey,
      })

      if (error) throw error
      if (!data.success) throw new Error(data.message)

      // Refresh institute data after renewal
      await this.fetchSession()
      return data
    },
    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.institute = null
      localStorage.removeItem('anw_current_institute')
    },
  },
})
