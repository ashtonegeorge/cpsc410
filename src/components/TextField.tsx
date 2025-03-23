export default function TextField({label, placeholder, setValue}: {label: string; placeholder: string; setValue: (value: string) => void}) {
    return (
        <div className="w-full m-2 p-1 px-2 bg-white focus-within:border-(--color-francis-red) border-3 border-white border-b-(--color-francis-red) rounded-t-xl">
            <h1 className="text-left text-(--color-francis-red) font-semibold">{label}</h1>
            <input 
                className='w-full text-xl outline-0 text-black' 
                type='text' 
                placeholder={placeholder ? placeholder : "Input Text"}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    )
}