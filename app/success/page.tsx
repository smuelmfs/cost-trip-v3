import Link from "next/link";

export default function SuccessPage() {
    return (
        <div className="container mx-auto text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-lg mb-6">
                Thank you for your payment. Your travel dashboard will be sent to your email shortly.
            </p>
            <Link href="/" className="text-blue-500 underline">
                Go back to Home
            </Link>
        </div>
    );
}
