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
              We collect information you provide directly to us when you create an account,
              take our artist type quiz, or contact us. This may include:
            </p>
            <ul>
              <li>Name and email address</li>
              <li>Quiz responses and results</li>
              <li>Communication preferences</li>
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
              We do not sell, trade, or otherwise transfer your personal information to third parties.
              We may share generic aggregated demographic information not linked to any personal
              identification information with our business partners and trusted affiliates.
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
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@myartisttype.com" className="text-primary hover:underline">
                privacy@myartisttype.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
} 