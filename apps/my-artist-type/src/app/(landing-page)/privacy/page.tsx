"use client"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 md:px-8">
        <div className="space-y-8 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2>Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you use our website, create an account,
              take our quizzes, answer our questionnaires, or contact us. This may include:
            </p>
            <ul>
              <li>Name and email address</li>
              <li>Quiz responses and results</li>
              <li>Communication preferences</li>
              <li>Public comments</li>
              <li>Any other information you choose to provide</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2>How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Send you quiz results and related content</li>
              <li>Respond to your comments and questions</li>
              <li>Send you technical notices and updates</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2>Information Sharing</h2>
            <p>
              We may share generic aggregated demographic information not linked to any personal
              identification information with our business partners and trusted affiliates.
            </p>
            <p>
              Your comments may be checked through an automated spam detection service.
            </p>
            <p>
              We may allow you to share your profile, information, and quiz results on other social media
              services for public viewing. Please review your social media service settings and the privacy policies
              on those services.
            </p>
          </section>

          <section className="mb-12">
            <h2>Affiliate Disclosure</h2>
            <p>
              Some of the links on this website may be affiliate or referral links, which may provide compensation to
              us from the service providers at no cost to you, if you decide to use their services. In order to credit
              this website with traffic, these services may track that your visit originated from one of the
              promotional links on this website.
            </p>
          </section>

          <section className="mb-12">
            <h2>Data Security</h2>
            <p>
              We implement appropriate data collection, storage, and processing practices and security
              measures to protect against unauthorized access, alteration, disclosure, or destruction
              of your personal information.
            </p>
          </section>

          <section className="mb-12">
            <h2>Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to our use of your information</li>
            </ul>
          </section>
		  		  
          <section>
            <h2>Disclaimer</h2>
            <p>
              The content on this website is for informational purposes only and should not be considered financial,
              medical, or legal advice. Consult professional advisors, as needed.
            </p>
          </section>
		  
          <section>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:contact@myartisttype.com" className="text-primary hover:underline">
                contact@myartisttype.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
} 
