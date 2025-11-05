export type TAsset = {
  asset_id: string
  url: string
  serve_url: string
  name: string
  filename: string
  mime_type: string
  size: number
  human_readable_size: string
  labels: {
    workspace_id: string
  }
  state: string
  state_message: string
}
