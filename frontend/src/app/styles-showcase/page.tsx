import Image from "next/image";

export default function stylesShowcase() {
  return (
    // <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-center  py-32 px-16 bg-white dark:bg-blue-500 sm:items-start">
        <h1 className="text-black dark:text-white">h1</h1>
        <h2 className="text-black dark:text-white">h2</h2>
        <h3 className="text-black dark:text-white">h3</h3>
        <h4 className="text-black dark:text-white">h4</h4>
        <h5 className="text-black dark:text-white">h5</h5>
        <h6 className="text-black dark:text-white">h6</h6>
      </main>
    </div>
  );
}
