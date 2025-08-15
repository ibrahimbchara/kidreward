import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kid Rewards</h1>
          <p className="text-gray-600">Parent Login - Manage your family's rewards!</p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
