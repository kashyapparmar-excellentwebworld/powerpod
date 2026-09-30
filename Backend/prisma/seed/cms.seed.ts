import { PrismaClient } from '@prisma/client'

export async function seedCmsPages(prisma: PrismaClient) {
  console.log('📄 Seeding CMS Pages...')

  const seedPages = [
    {
      slug: 'privacy-policy',
      status: 'PUBLISHED' as const,
      translations: [
        {
          languageCode: 'en',
          title: 'Privacy Policy',
          metaTitle: 'Privacy Policy - Wasla Platform',
          metaDescription: 'Read our comprehensive privacy policy and learn how we protect your personal data.',
          contentHtml: `
            <h1>Privacy Policy</h1>
            <p>Last Updated: July 28, 2026</p>
            <hr />
            <h2>1. Information We Collect</h2>
            <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, and password hash.</li>
              <li><strong>Usage Data:</strong> Pages visited, browser type, device information, and IP address.</li>
              <li><strong>Transactions:</strong> Payment details and order history.</li>
            </ul>
            <h2>2. How We Use Information</h2>
            <p>We use the collected data to operate, maintain, and improve our services, process transactions, and communicate with you.</p>
            <h2>3. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please email us at <a href="mailto:support@wasla.com">support@wasla.com</a>.</p>
          `
        },
        {
          languageCode: 'ar',
          title: 'سياسة الخصوصية',
          metaTitle: 'سياسة الخصوصية - منصة وصلة',
          metaDescription: 'اقرأ سياسة الخصوصية الشاملة وتعرف على كيفية حماية بياناتك الشخصية.',
          contentHtml: `
            <h1>سياسة الخصوصية</h1>
            <p>آخر تحديث: 28 يوليو 2026</p>
            <hr />
            <h2>1. المعلومات التي نجمعها</h2>
            <p>نجمع المعلومات لتقديم خدمات أفضل لجميع مستخدمينا. تشمل أنواع المعلومات التي نجمعها:</p>
            <ul>
              <li><strong>معلومات الحساب:</strong> الاسم، عنوان البريد الإلكتروني، رقم الهاتف.</li>
              <li><strong>بيانات الاستخدام:</strong> الصفحات المزارة، نوع المتصفح، ومعلومات الجهاز.</li>
            </ul>
            <h2>2. التواعل معنا</h2>
            <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى مراسلتنا عبر البريد الإلكتروني: <a href="mailto:support@wasla.com">support@wasla.com</a>.</p>
          `
        }
      ]
    },
    {
      slug: 'terms-and-conditions',
      status: 'PUBLISHED' as const,
      translations: [
        {
          languageCode: 'en',
          title: 'Terms & Conditions',
          metaTitle: 'Terms & Conditions - Wasla Platform',
          metaDescription: 'Read the terms and conditions governing the use of our services.',
          contentHtml: `
            <h1>Terms & Conditions</h1>
            <p>Last Updated: July 28, 2026</p>
            <hr />
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using our platform, you agree to be bound by these terms and conditions.</p>
            <h2>2. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          `
        },
        {
          languageCode: 'ar',
          title: 'الشروط والأحكام',
          metaTitle: 'الشروط والأحكام - منصة وصلة',
          metaDescription: 'اقرأ الشروط والأحكام الخاصة باستخدام خدماتنا.',
          contentHtml: `
            <h1>الشروط والأحكام</h1>
            <p>آخر تحديث: 28 يوليو 2026</p>
            <hr />
            <h2>1. قبول الشروط</h2>
            <p>من خلال الوصول إلى منصتنا أو استخدامها، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>
          `
        }
      ]
    },
    {
      slug: 'about-us',
      status: 'PUBLISHED' as const,
      translations: [
        {
          languageCode: 'en',
          title: 'About Us',
          metaTitle: 'About Us - Wasla Platform',
          metaDescription: 'Learn more about Wasla and our vision to connect buyers and suppliers.',
          contentHtml: `
            <h1>About Wasla</h1>
            <p>Wasla is the premier B2B marketplace platform connecting suppliers and buyers across the region.</p>
          `
        }
      ]
    },
    {
      slug: 'faq',
      status: 'PUBLISHED' as const,
      translations: [
        {
          languageCode: 'en',
          title: 'Frequently Asked Questions',
          metaTitle: 'FAQ - Wasla Support',
          metaDescription: 'Find answers to common questions about orders, payments, and supplier registration.',
          contentHtml: `
            <h1>Frequently Asked Questions</h1>
            <h2>Q: How do I create a supplier account?</h2>
            <p>A: Click on Supplier Register on the homepage and complete the KYC verification steps.</p>
          `
        }
      ]
    }
  ]

  for (const pData of seedPages) {
    const existing = await prisma.cmsPage.findUnique({
      where: { slug: pData.slug }
    })

    if (!existing) {
      const page = await prisma.cmsPage.create({
        data: {
          slug: pData.slug,
          status: pData.status
        }
      })

      for (const tr of pData.translations) {
        await prisma.cmsPageTranslation.create({
          data: {
            pageId: page.id,
            languageCode: tr.languageCode,
            title: tr.title,
            metaTitle: tr.metaTitle,
            metaDescription: tr.metaDescription,
            contentHtml: tr.contentHtml,
            publishedVersion: 1
          }
        })

        await prisma.cmsPageVersion.create({
          data: {
            pageId: page.id,
            languageCode: tr.languageCode,
            version: 1,
            title: tr.title,
            contentHtml: tr.contentHtml,
            metaTitle: tr.metaTitle,
            metaDescription: tr.metaDescription
          }
        })
      }
    }
  }

  console.log('✅ CMS Pages seeded successfully!')
}
