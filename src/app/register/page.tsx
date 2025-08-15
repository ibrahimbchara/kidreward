import AuthForm from '@/components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kid Rewards</h1>
          <p className="text-gray-600">Create your parent account to start managing rewards!</p>
        </div>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
