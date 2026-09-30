import { PrismaClient } from '@prisma/client'

export async function seedAppVersions(prisma: PrismaClient) {
  console.log('📱 Seeding App Versions...')

  const versionsToSeed = [
    {
      platform: 'ANDROID' as const,
      currentVersion: '1.4.0',
      minimumSupported: '1.2.0',
      recommendedVersion: '1.3.5',
      forceUpdate: false,
      maintenanceMode: false,
      maintenanceMessage: null,
      rolloutPercentage: 100,
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.wasla.app',
      status: 'PUBLISHED' as const,
      translations: [
        {
          languageCode: 'en',
          title: 'New Version Available',
          description: 'Includes security enhancements, performance updates, and bug fixes.',
          updateButtonText: 'Update Now',
          skipButtonText: 'Later',
          maintenanceTitle: 'Application Under Maintenance',
          maintenanceDescription: 'We are conducting planned system maintenance. Please try again in a few minutes.'
        },
        {
          languageCode: 'ar',
          title: 'تحديث جديد متوفر',
          description: 'يتضمن تحسينات في الأداء وإصلاحات للأخطاء وإضافات أمان جديدة.',
          updateButtonText: 'تحديث الآن',
          skipButtonText: 'لاحقاً',
          maintenanceTitle: 'التطبيق قيد الصيانة',
          maintenanceDescription: 'نقوم حالياً بإجراء صيانة مجدولة للنظام. يرجى المحاولة مرة أخرى لاحقاً.'
        }
      ]
    },
    {
      platform: 'IOS' as const,
      currentVersion: '1.4.0',
      minimumSupported: '1.2.0',
      recommendedVersion: '1.3.5',
      forceUpdate: false,
      maintenanceMode: false,
      maintenanceMessage: null,
      rolloutPercentage: 100,
      appStoreUrl: 'https://apps.apple.com/app/id123456789',
      status: 'PUBLISHED' as const,
      translations: [
        {
          languageCode: 'en',
          title: 'Update Required',
          description: 'Enjoy a faster experience with new iOS 18 features and stability improvements.',
          updateButtonText: 'Update Now',
          skipButtonText: 'Later'
        },
        {
          languageCode: 'ar',
          title: 'تحديث مطلوب',
          description: 'استمتع بتجربة أسرع مع ميزات جديدة وتحسينات في الأداء.',
          updateButtonText: 'تحديث الآن',
          skipButtonText: 'لاحقاً'
        }
      ]
    },
    {
      platform: 'WEB' as const,
      currentVersion: '2.0.0',
      minimumSupported: '1.5.0',
      recommendedVersion: '1.9.0',
      forceUpdate: false,
      maintenanceMode: false,
      maintenanceMessage: null,
      rolloutPercentage: 100,
      webUrl: 'https://wasla.com',
      status: 'PUBLISHED' as const,
      translations: [
        {
          languageCode: 'en',
          title: 'Web Platform Release 2.0',
          description: 'Major web marketplace overhaul with real-time notifications.',
          updateButtonText: 'Reload Application',
          skipButtonText: 'Dismiss'
        }
      ]
    }
  ]

  for (const item of versionsToSeed) {
    const existing = await prisma.appVersion.findFirst({
      where: { platform: item.platform, status: 'PUBLISHED' }
    })

    if (!existing) {
      const created = await prisma.appVersion.create({
        data: {
          platform: item.platform,
          currentVersion: item.currentVersion,
          minimumSupported: item.minimumSupported,
          recommendedVersion: item.recommendedVersion,
          forceUpdate: item.forceUpdate,
          maintenanceMode: item.maintenanceMode,
          maintenanceMessage: item.maintenanceMessage,
          rolloutPercentage: item.rolloutPercentage,
          playStoreUrl: item.playStoreUrl,
          appStoreUrl: item.appStoreUrl,
          webUrl: item.webUrl,
          status: item.status,
          appTranslations: {
            create: item.translations
          }
        }
      })

      await prisma.appVersionHistory.create({
        data: {
          appVersionId: created.id,
          platform: item.platform,
          version: item.currentVersion,
          releaseNotes: 'Initial seed release'
        }
      })
    }
  }

  console.log('✅ App Versions seeded successfully!')
}
