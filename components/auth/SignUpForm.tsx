import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as Yup from 'yup';
import { Button, Input } from 'react-daisyui';
import { maxLengthPolicies } from '@/lib/common';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import toast from 'react-hot-toast';

export const SignUpForm = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { executeRecaptcha } = useRecaptcha();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .required(t('required'))
        .max(maxLengthPolicies.name),
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

      const response = await fetch('/api/auth/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, recaptchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error.message);
        return;
      }

      router.push('/auth/login?registered=true');
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <Input
        type="text"
        name="name"
        placeholder={t('name')}
        value={formik.values.name}
        onChange={formik.handleChange}
        className="w-full"
      />
      {formik.touched.name && formik.errors.name && (
        <div className="text-error text-sm">{formik.errors.name}</div>
      )}

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
        {t('sign-up')}
      </Button>
    </form>
  );
}; 