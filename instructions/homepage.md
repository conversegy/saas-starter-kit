# Editing the Features Section

## File Paths

- **Features Data:** `components/defaultLanding/data/features.json`
- **Feature Component:** `components/defaultLanding/FeatureSection.tsx`

## Updating Features

1. **Locate `features.json`:**
   ```json:components/defaultLanding/data/features.json
   [
     {
       "name": "Create Account",
       "description": "Quickly create your Conversegy account to access a suite of AI tools designed to boost your productivity."
     },
     // ... other features
   ]
   ```

2. **Add a New Feature:**
   - Append a new object with `name` and `description`.
     ```json
     {
       "name": "New Feature Name",
       "description": "Description of the new feature."
     }
     ```

3. **Modify Existing Features:**
   - Update the `name` or `description` fields as needed.

4. **Remove a Feature:**
   - Delete the corresponding feature object from the array.

## Updating the Feature Component

1. **Locate `FeatureSection.tsx`:**
   ```typescript:components/defaultLanding/FeatureSection.tsx
   import { motion, useReducedMotion } from 'framer-motion';
   import { useTranslation } from 'next-i18next';
   import features from './data/features.json';
   import { CheckCircleIcon } from '@heroicons/react/24/solid';
   
   // ...variants
   
   const FeatureSection = () => {
     // ...component code
   };
   
   export default FeatureSection;
   ```

2. **Icon Management:**
   - **Default Icon:** Uses `CheckCircleIcon` from Heroicons v2.
   - **Change Icon for a Feature:**
     - Import the desired icon:
       ```typescript
       import { NewIcon } from '@heroicons/react/24/solid';
       ```
     - Replace `CheckCircleIcon` with `NewIcon` in the JSX.

3. **Styling Adjustments:**
   - Modify Tailwind CSS classes within the JSX to alter layout, colors, or spacing as required.

4. **Animation Tweaks:**
   - Adjust `containerVariants` and `cardVariants` within the component for different animation behaviors.

## Additional Considerations

- **Translations:**
  - Ensure that any new feature names or descriptions are added to the translation files if using internationalization.
  
- **Accessibility:**
  - Verify that updates maintain semantic HTML and ARIA attributes for accessibility.

- **Testing:**
  - After modifications, test the features section across different devices and screen sizes to ensure responsiveness and performance.

- **Dependencies:**
  - If adding new icons, ensure they are correctly imported from Heroicons v2 and that the library is up-to-date.

## Summary

1. **Edit `features.json`** to manage feature content.
2. **Update `FeatureSection.tsx`** for any UI or icon changes.
3. **Maintain consistency** with translations and accessibility standards.
4. **Test thoroughly** to ensure seamless integration.


# Editing the Pricing Section

## File Paths

- **Pricing Data:** `components/defaultLanding/data/pricing.json`
- **Pricing Component:** `components/defaultLanding/PricingSection.tsx`

## Updating Pricing Plans

1. **Locate `pricing.json`:**
   
   ```json:components/defaultLanding/data/pricing.json
   [
     {
       "name": "Starter",
       "amount": "0",
       "currency": "USD",
       "duration": "month",
       "description": "Free plan with essential features to get you started. Credits are deducted each time an app is used within the dashboard.",
       "benefits": [
         "100 credits per month",
         "Access to all AI tools",
         "Community support"
       ]
     },
     // ... other plans
   ]
   ```

2. **Add a New Plan:**
   
   - Ensure the new plan includes all required fields and maintains the same number of benefits as existing plans.
   
     ```json
     {
       "name": "Enterprise",
       "amount": "49",
       "currency": "USD",
       "duration": "month",
       "description": "$49/month plan for large organizations. Credits are deducted each time an app is used within the dashboard.",
       "benefits": [
         "5000 credits per month",
         "Access to all AI tools",
         "Dedicated support"
       ]
     }
     ```

3. **Modify an Existing Plan:**
   
   - Update the `name`, `amount`, `description`, or `benefits` as needed. Ensure that the number of benefits remains consistent across all plans.
   
     ```json
     {
       "name": "Pro",
       "amount": "9",
       "currency": "USD",
       "duration": "month",
       "description": "$9/month plan with advanced features. Credits are deducted each time an app is used within the dashboard.",
       "benefits": [
         "500 credits per month",
         "Access to all AI tools",
         "Priority email support"
       ]
     }
     ```

4. **Remove a Plan:**
   
   - Delete the corresponding plan object from the array.
   
     ```json
     // Remove the "Advanced" plan if necessary
     ```

## Updating the Pricing Component

1. **Locate `PricingSection.tsx`:**
   
   ```typescript:components/defaultLanding/PricingSection.tsx
   import { CheckIcon } from '@heroicons/react/24/solid';
   import { useTranslation } from 'next-i18next';
   import { Button, Card } from 'react-daisyui';
   
   import plans from './data/pricing.json';
   
   const PricingSection = () => {
     const { t } = useTranslation('common');
     // ...component code
   };
   
   export default PricingSection;
   ```

2. **Ensure Consistent Benefits Rendering:**
   
   - Verify that all plans have the same number of benefits to maintain a uniform design.
   - Update the JSX to reflect any changes in the number of benefits if necessary.
   
     ```typescript
     <ul className="space-y-3">
       {plan.benefits.map((benefit: string, itemIndex: number) => (
         <li
           key={`plan-${index}-benefit-${itemIndex}`}
           className="flex items-center"
         >
           <CheckIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
           <span className="ml-3 text-gray-700">{benefit}</span>
         </li>
       ))}
     </ul>
     ```

3. **Icon Management:**
   
   - **Default Icon:** Uses `CheckIcon` from Heroicons v2.
   - **Change Icon for a Feature:**
     - Import the desired icon:
       
       ```typescript
       import { NewIcon } from '@heroicons/react/24/solid';
       ```
     
     - Replace `CheckIcon` with `NewIcon` in the JSX.
     
       ```typescript
       <NewIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
       ```

4. **Styling Adjustments:**
   
   - **Card Highlighting:**
     - The "Pro" plan is highlighted with a thicker blue border to emphasize it as the recommended choice.
     
       ```typescript
       className={`flex flex-col justify-between rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${
         plan.name === 'Pro' ? 'border-4 border-blue-500' : 'border border-gray-300'
       }`}
       ```
   
   - **Pricing Display:**
     - Conditionally render "Free" for the Starter plan instead of `$0`.
     
       ```typescript
       <p className="text-3xl font-bold text-gray-900 mb-4">
         {plan.currency === 'USD' && plan.amount !== '0' ? `$${plan.amount}` : 'Free'}
         <span className="text-lg font-medium text-gray-500">/{plan.duration}</span>
       </p>
       ```
   
   - **Button Styling:**
     - Apply consistent styling to buttons, differentiating the "Pro" plan with a primary color.
     
       ```typescript
       <Button
         color={plan.name === 'Pro' ? 'primary' : 'secondary'}
         className="w-full text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
         size="md"
       >
         {t('buy-now')}
       </Button>
       ```

5. **Responsive Design:**
   
   - Ensure the grid layout adapts seamlessly across different screen sizes.
     
     ```typescript
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
     ```
   
   - Adjust padding and margins as necessary to maintain a clean layout.
     
     ```typescript
     <section className="py-12 bg-gradient-to-r from-gray-100 to-gray-200">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     ```

6. **Animation Tweaks (Optional):**
   
   - Incorporate animations using Framer Motion for enhanced interactivity.
   - Example: Add a hover scale effect to cards.
     
     ```typescript
     import { motion } from 'framer-motion';
     
     <motion.div
       whileHover={{ scale: 1.05 }}
       className={`flex flex-col justify-between rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${
         plan.name === 'Pro' ? 'border-4 border-blue-500' : 'border border-gray-300'
       }`}
     >
       {/* Card Content */}
     </motion.div>
     ```

## Additional Considerations

- **Translations:**
  
  - Update `common.json` (or relevant translation files) to include any new plan names, descriptions, or benefits.
    
    ```json
    // public/locales/en/common.json
    {
      "pricing": "Pricing",
      "buy-now": "Buy Now",
      "starter": "Starter",
      "pro": "Pro",
      "advanced": "Advanced",
      "enterprise": "Enterprise",
      // ...other translations
    }
    ```

- **Accessibility:**
  
  - Maintain semantic HTML elements for better accessibility.
  - Ensure sufficient color contrast between text and backgrounds.
  - Use ARIA attributes if necessary to enhance screen reader compatibility.
  
    ```typescript
    <section aria-labelledby="pricing-heading">
      <h2 id="pricing-heading" className="text-4xl font-extrabold text-gray-900 mb-4">
        {t('pricing')}
      </h2>
      {/* Rest of the component */}
    </section>
    ```


- **Icon Dependencies:**
  
  - If adding new icons, confirm they are correctly imported from Heroicons v2.
  
    ```typescript
    import { NewIcon } from '@heroicons/react/24/solid';
    ```

- **Performance Optimization:**
  
  - Optimize SVG icons for quick loading.
  - Ensure that adding more plans does not negatively impact the load time or performance of the page.

## Summary

1. **Edit `pricing.json`:**
   - Manage plan content by adding, modifying, or removing plans.
   - Maintain consistency in the number of benefits across all plans.

2. **Update `PricingSection.tsx`:**
   - Align the component with the updated `pricing.json`.
   - Maintain consistent styling, layout, and icon usage.
   - Highlight the most popular plan (e.g., "Pro") for better user guidance.



