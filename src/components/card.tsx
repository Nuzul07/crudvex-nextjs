import React from "react"

export type CardProps<T> = {
    data: T
    konten: (data: T) => React.ReactNode
    footer: (data: T) => React.ReactNode
    className?: string
    onClick?: (data: T) => void
}

export default function Card<T>({
    data,
    konten,
    footer,
    className = "",
    onClick
}: CardProps<T>): React.ReactElement {
    return(
        <div 
            onClick={() => onClick?.(data)}
            className={`
                group
                cursor-pointer
                rounded-xl
                border border-gray-200
                bg-white
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-md
                ${className}    
            `}
        >
            <div className="p-4">
                {konten(data)}
            </div>

            {footer && (
                <div className="border-t border-gray-100 px-4 py-3">
                    {footer(data)}
                </div>
            )}
        </div>
    )
}