import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';

const Dashboard: NextPageWithLayout = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Welcome to your AI Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Credits Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Credits Remaining</h2>
          <div className="text-3xl font-bold text-blue-600">1,234</div>
          <p className="text-gray-600 text-sm mt-2">Credits available to use</p>
        </div>

        {/* Last Used Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Last Used</h2>
          <div className="text-xl font-medium">Emoji Generator</div>
          <p className="text-gray-600 mt-2">"Create a happy Sonic the Hedgehog"</p>
          <p className="text-gray-500 text-sm mt-2">2 hours ago</p>
        </div>

        {/* Most Popular Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Most Popular</h2>
          <div className="text-xl font-medium">Image Generator</div>
          <p className="text-gray-600 mt-2">Used 47 times this week</p>
        </div>
      </div>

      <p>This is your personal dashboard.</p>
    </div>
  );
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default Dashboard;
