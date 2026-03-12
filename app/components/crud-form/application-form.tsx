import { Button } from '@shadcn/ui/button'
import {
  ApplicationFormData,
  ApplicationFormValue,
  applicationFormSchema,
  formValuesToApplicationData,
  getApplicationLogoSrc,
} from '@/resources/queries/applications'
import { useNavigate } from 'react-router'
import { Loader2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Form } from '../form'
import { FormLayout } from '../form/form-layout'
import { MAX_FILE_SIZE } from '@/constants/file'
import { toast } from 'sonner'
import { TAsset } from '@/resources/types'

interface ApplicationFormProps {
  defaultValues: ApplicationFormValue
  onSubmit: (data: ApplicationFormData) => Promise<void> | void
  submitLabel?: string
  isEdit?: boolean
  token: string
  vaultaApiUrl: string
}

interface LogoUploadProps {
  isSubmitting: boolean
  logoPreview: string
  selectedFileName?: string
  onFileSelected: (file: File) => void
}

const LogoUpload = ({
  isSubmitting,
  logoPreview,
  selectedFileName,
  onFileSelected,
}: LogoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 1MB', { duration: 5000 })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file', { duration: 5000 })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    onFileSelected(file)
  }

  return (
    <div className="rounded-md border p-4">
      <div className="flex items-center gap-4">
        <div
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border
            bg-muted/30">
          {logoPreview ? (
            <img src={logoPreview} alt="application-logo" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">No logo</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Logo</p>
          <p className="text-xs text-muted-foreground">PNG, JPG up to 1MB.</p>
          {selectedFileName && (
            <p className="mt-1 text-xs text-muted-foreground">Selected: {selectedFileName}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            name="logo_img"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
            disabled={isSubmitting}
          />
          <Button
            variant="secondary"
            type="button"
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}>
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose Logo
            </>
          </Button>
        </div>
      </div>
    </div>
  )
}

export const ApplicationForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  isEdit = false,
  token,
  vaultaApiUrl,
}: ApplicationFormProps) => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>(
    getApplicationLogoSrc(defaultValues.logo) || ''
  )
  const logoObjectUrlRef = useRef<string | null>(null)

  const title = isEdit ? 'Edit Application' : 'New Application'

  useEffect(() => {
    return () => {
      if (logoObjectUrlRef.current) {
        URL.revokeObjectURL(logoObjectUrlRef.current)
        logoObjectUrlRef.current = null
      }
    }
  }, [])

  const handleLogoSelected = (file: File) => {
    if (logoObjectUrlRef.current) {
      URL.revokeObjectURL(logoObjectUrlRef.current)
    }

    const objectUrl = URL.createObjectURL(file)
    logoObjectUrlRef.current = objectUrl
    setLogoPreview(objectUrl)
    setLogoFile(file)
  }

  const handleSubmit = async (data: ApplicationFormValue) => {
    setIsSubmitting(true)

    try {
      let logoUrl = data.logo || ''

      if (logoFile) {
        const uploadPayload = new FormData()
        uploadPayload.set('name', data.name || 'application-logo')
        uploadPayload.set('file', logoFile)
        console.log('vaultaApiUrl ', vaultaApiUrl)

        const assetResponse = await fetch(`${vaultaApiUrl}/assets`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadPayload,
        })

        const assetData: TAsset = await assetResponse.json()
        logoUrl = assetData.url
      }

      const applicationData = formValuesToApplicationData(data)
      applicationData.logo = logoUrl
      await onSubmit(applicationData)
    } catch {
      // Error handling is done by parent component
    } finally {
      setIsUploadingLogo(false)
      setIsSubmitting(false)
      setLogoFile(null)
    }
  }

  return (
    <Form
      schema={applicationFormSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      reValidateMode="onBlur">
      <FormLayout title={title}>
        <LogoUpload
          isSubmitting={isSubmitting || isUploadingLogo}
          logoPreview={logoPreview}
          selectedFileName={logoFile?.name}
          onFileSelected={handleLogoSelected}
        />

        <Form.Input
          autoFocus
          field="name"
          label="Name"
          placeholder="Enter application name"
          required
        />

        <Form.Input field="url" label="URL" placeholder="https://example.com" required />

        <Form.Textarea
          field="description"
          label="Description"
          placeholder="Describe this application"
          rows={4}
        />

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate('/applications')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </FormLayout>
    </Form>
  )
}
