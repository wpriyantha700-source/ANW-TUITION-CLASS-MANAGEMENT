import { defineStore } from 'pinia'
import { supabase } from 'src/boot/supabase'
import { useUserStore } from './userStore'

export const useMaterialStore = defineStore('material', {
  state: () => ({
    materials: [],
    loading: false,
  }),

  actions: {
    async fetchMaterials() {
      this.loading = true
      const userStore = useUserStore()

      if (!userStore.institute?.id) {
        this.loading = false
        return
      }

      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('institute_id', userStore.institute.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching materials:', error)
        this.loading = false
        return
      }

      this.materials = data.map((m) => ({
        ...m,
        type: m.file_type,
        size: m.file_size,
        date: new Date(m.created_at).toISOString().split('T')[0],
        downloadCount: m.download_count,
        fileUrl: m.file_url,
      }))
      this.loading = false
    },

    async addMaterial(material) {
      const userStore = useUserStore()
      if (!userStore.institute?.id) {
        throw new Error('Institute context missing. Please reload the page.')
      }

      this.loading = true

      try {
        let fileUrl = ''

        // 1. Upload File to Storage
        if (material.file) {
          // Sanitize filename to avoid issues with special characters and spaces
          const fileExt = material.file.name.split('.').pop()
          const cleanName = material.file.name
            .replace(/[^a-zA-Z0-9.]/g, '_') // Replace anything not alphanumeric or dot with underscore
            .substring(0, 50) // Limit length

          const fileName = `${Date.now()}-${cleanName}.${fileExt}`
          const filePath = `${userStore.institute.id}/${fileName}`

          console.log('Attempting upload to storage:', filePath)

          const { error: uploadError } = await supabase.storage
            .from('class_materials')
            .upload(filePath, material.file, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) {
            console.error('Storage upload error:', uploadError)
            throw new Error(`Storage Error: ${uploadError.message}`)
          }

          // 2. Get Public URL
          const { data: urlData } = supabase.storage.from('class_materials').getPublicUrl(filePath)

          if (!urlData?.publicUrl) {
            throw new Error('Failed to generate file URL')
          }

          fileUrl = urlData.publicUrl
        }

        // 3. Save Record to Database
        const { data, error } = await supabase
          .from('materials')
          .insert([
            {
              institute_id: userStore.institute.id,
              title: material.title,
              subject: material.subject,
              grade: material.grade,
              teacher: material.teacher,
              file_type: material.type,
              file_size: material.size || '0 KB',
              file_url: fileUrl,
            },
          ])
          .select()

        if (error) {
          console.error('Error adding material:', error)
          throw error
        }

        if (data && data[0]) {
          this.materials.unshift({
            ...data[0],
            type: data[0].file_type,
            size: data[0].file_size,
            date: new Date(data[0].created_at).toISOString().split('T')[0],
            downloadCount: data[0].download_count,
            fileUrl: data[0].file_url,
          })
        }
      } catch (err) {
        console.error('Upload failed:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteMaterial(id) {
      const { error } = await supabase.from('materials').delete().eq('id', id)

      if (error) {
        console.error('Error deleting material:', error)
        throw error
      }

      this.materials = this.materials.filter((m) => m.id !== id)
    },
  },
})
