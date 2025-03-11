export default function Button({label, action} : {label: string; action: () => Promise<void>}) {
    return (
        <button className="bg-(--color-francis-red) w-full p-2 md:p-4 rounded-lg hover:bg-red-700 transition-colors cursor-pointer" onClick={action}>
            <h1 className="lg:text-xl font-semibold">{label}</h1>
        </button>
    )
}