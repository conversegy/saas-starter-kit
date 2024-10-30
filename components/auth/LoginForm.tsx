import { useFormik } from 'formik';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as Yup from 'yup';
import { Button, Input } from 'react-daisyui';
import { maxLengthPolicies } from '@/lib/common';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import toast from 'react-hot-toast';

export const LoginForm = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { executeRecaptcha } = useRecaptcha();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email(t('invalid-email'))
        .required(t('required'))
        .max(maxLengthPolicies.email),
      password: Yup.string()
        .required(t('required'))
        .max(maxLengthPolicies.password),
    }),
    onSubmit: async (values) => {
      const recaptchaToken = await executeRecaptcha();

      const response = await signIn('credentials', {
        email: values.email,
        password: values.password,
        recaptchaToken,
        redirect: false,
      });

      if (!response?.ok) {
        toast.error(t(response?.error || 'invalid-credentials'));
        return;
      }

      router.push('/dashboard');
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <Input
        type="email"
        name="email"
        placeholder={t('email')}
        value={formik.values.email}
        onChange={formik.handleChange}
        className="w-full"
      />
      {formik.touched.email && formik.errors.email && (
        <div className="text-error text-sm">{formik.errors.email}</div>
      )}

      <Input
        type="password"
        name="password"
        placeholder={t('password')}
        value={formik.values.password}
        onChange={formik.handleChange}
        className="w-full"
      />
      {formik.touched.password && formik.errors.password && (
        <div className="text-error text-sm">{formik.errors.password}</div>
      )}

      <Button
        type="submit"
        color="primary"
        loading={formik.isSubmitting}
        className="w-full"
      >
        {t('sign-in')}
      </Button>
    </form>
  );
}; 