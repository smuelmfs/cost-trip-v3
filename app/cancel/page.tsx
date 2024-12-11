import Link from "next/link";

export default function CancelPage() {
    return (
        <div className="container mx-auto text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
            <p className="text-lg mb-6">
                Something went wrong with your payment. Don’t worry, you can try again.
            </p>
            <Link href="/" className="text-blue-500 underline">
                Go back to Home
            </Link>
        </div>
    );
}
