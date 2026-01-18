import { Button, Card, Input, cn, Separator } from '@shadcn';
import { Link } from '@tanstack/react-router';
import { Result, useAtom, useAtomSet } from '@effect-atom/atom-react';
import { useForm } from '@tanstack/react-form';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Schema from 'effect/Schema';

import { signInAtom, signInWithGoogleAtom } from '../client/atoms.js';
import type { SignInInput } from '../domain/schema.js';

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
      <path fill="none" d="M1 1h22v22H1z" />
    </svg>
  );
}

// Define the form schema using Effect Schema
const SignInSchema = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
});

export interface SignInFormProps {
  className?: string;
  redirectTo?: string;
}

export function SignInForm({ className, redirectTo = '/' }: SignInFormProps) {
  const [signInResult, signIn] = useAtom(signInAtom);
  const signInWithGoogle = useAtomSet(signInWithGoogleAtom);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    try {
      signInWithGoogle();
    } catch (error) {
      setGoogleError(error instanceof Error ? error.message : 'Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate using Effect Schema
        const validated = Schema.decodeSync(SignInSchema)(value);

        const input: SignInInput = {
          email: validated.email,
          password: validated.password,
          callbackURL: redirectTo,
        };

        signIn(input);
      } catch {
        // Validation errors are handled by field validators
        // This shouldn't be reached in normal flow
      }
    },
  });

  // Handle successful sign in
  useEffect(() => {
    if (Result.isSuccess(signInResult)) {
      window.location.href = redirectTo;
    }
  }, [signInResult, redirectTo]);

  const isLoading = Result.isInitial(signInResult) && signInResult.waiting;
  const error = Result.builder(signInResult)
    .onFailure((failure) => failure)
    .orNull();

  return (
    <Card className={cn('w-full max-w-sm', className)}>
      <Card.Header>
        <Card.Title>Sign In</Card.Title>
        <Card.Description>Enter your email and password to sign in</Card.Description>
      </Card.Header>

      <Card.Content>
        {/* Google Sign In Button */}
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <GoogleIcon className="mr-2 size-4" />
                Continue with Google
              </>
            )}
          </Button>

          {googleError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-sm text-destructive">
              {googleError}
            </div>
          )}
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Email Field */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return 'Invalid email format';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id={field.name}
                  type="email"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  className={cn(field.state.meta.errors.length > 0 && 'border-destructive')}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Password Field */}
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Password is required';
                if (value.length < 8) {
                  return 'Password must be at least 8 characters';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id={field.name}
                  type="password"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  className={cn(field.state.meta.errors.length > 0 && 'border-destructive')}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to sign in. Please try again.'}
            </div>
          )}

          {/* Submit Button */}
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isLoading || isSubmitting} className="w-full">
                {isLoading || isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>

        {/* Footer Links */}
        <div className="mt-4 space-y-2 text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{' '}
            <Link
              to="/auth/$authView"
              params={{ authView: 'sign-up' }}
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
          <p>
            <Link
              to="/auth/$authView"
              params={{ authView: 'forgot-password' }}
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}
