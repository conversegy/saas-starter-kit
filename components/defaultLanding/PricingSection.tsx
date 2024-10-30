import { CheckIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'next-i18next';
import { Button, Card } from 'react-daisyui';

import plans from './data/pricing.json';

const PricingSection = () => {
  const { t } = useTranslation('common');
  return (
    <section className="py-12 bg-gradient-to-r from-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            {t('pricing')}
          </h2>
          <p className="text-lg text-gray-600">
            Choose a plan that fits your needs and start leveraging Conversegy's AI tools to boost your productivity.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={`plan-${index}`}
              className={`flex flex-col justify-between rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${
                plan.name === 'Pro' ? 'border-4 border-blue-500' : 'border border-gray-300'
              }`}
            >
              <Card.Body>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  {plan.name}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  {plan.currency === 'USD' && plan.amount !== '0' ? `$${plan.amount}` : 'Free'}
                  <span className="text-lg font-medium text-gray-500">/{plan.duration}</span>
                </p>
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>
                <ul className="space-y-3">
                  {plan.benefits.map((benefit, itemIndex) => (
                    <li key={`plan-${index}-benefit-${itemIndex}`} className="flex items-center">
                      <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="ml-3 text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
              <Card.Actions className="px-6 py-4">
                <Button
                  color={plan.name === 'Pro' ? 'primary' : 'secondary'}
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                  size="md"
                >
                  {t('buy-now')}
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          *Credits are deducted each time an app is used within the dashboard.
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
