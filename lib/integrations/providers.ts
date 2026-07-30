export type ProviderStatus = {
  email: boolean
  sms: boolean
  whatsapp: boolean
}

function isEnabled(value: string | undefined) {
  return ["1", "true", "yes", "enabled", "on"].includes(value?.trim().toLowerCase() ?? "")
}

export function getProviderStatus(env: NodeJS.ProcessEnv = process.env): ProviderStatus {
  return {
    email: isEnabled(env.NDOA_EMAIL_PROVIDER_ENABLED),
    sms: isEnabled(env.NDOA_SMS_PROVIDER_ENABLED),
    whatsapp: isEnabled(env.NDOA_WHATSAPP_PROVIDER_ENABLED),
  }
}
