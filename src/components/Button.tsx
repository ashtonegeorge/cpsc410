export default function Button({label, icon, action} : {label: string; icon: string | null; action: () => Promise<void>}) {
    return (
        <button className="bg-(--color-francis-red) flex justify-center gap-2 align-middle w-full p-2 md:p-4 rounded-lg hover:bg-red-700 transition-colors cursor-pointer" onClick={action}>
            {icon && <img src={icon} className="w-8 invert" />}
            <h1 className="lg:text-xl font-semibold my-auto">{label}</h1>
        </button>
    )
}