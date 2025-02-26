"use client";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 md:px-8">
        <div className="space-y-8 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using My Artist Type, you accept and agree to be
              bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-12">
            <h2>2. Description of Service</h2>
            <p>
              My Artist Type provides an online platform for artists to discover
              their creative personality type through our assessment tools and
              educational resources.
            </p>
          </section>

          <section className="mb-12">
            <h2>3. User Conduct</h2>
            <p>
              You agree to use our services only for lawful purposes and in a
              way that does not infringe the rights of, restrict or inhibit
              anyone else&apos;s use and enjoyment of the website.
            </p>
          </section>

          <section className="mb-12">
            <h2>4. Intellectual Property</h2>
            <p>
              The content, organization, graphics, design, compilation, and
              other matters related to the website are protected under
              applicable copyrights and other proprietary rights.
            </p>
          </section>

          <section className="mb-12">
            <h2>5. Limitation of Liability</h2>
            <p>
              My Artist Type shall not be liable for any indirect, incidental,
              special, consequential or punitive damages, or any loss of profits
              or revenues.
            </p>
          </section>

          <section className="mb-12">
            <h2>6. Modifications to Service</h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or
              permanently, the service with or without notice.
            </p>
          </section>

          <section className="mb-12">
            <h2>7. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which we operate.
            </p>
          </section>

          <section>
            <h2>8. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@myartisttype.com"
                className="text-primary hover:underline"
              >
                legal@myartisttype.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
