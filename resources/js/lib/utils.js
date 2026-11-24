import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const mergeClasses = extendTailwindMerge({
    extend: {
        classGroups: {
            rounded: [{ rounded: ['control', 'editorial', 'card', 'panel', 'pill'] }],
            'max-w': [{ 'max-w': ['content', 'content-reading'] }],
        },
    },
});

export function cn(...inputs) {
    return mergeClasses(clsx(inputs));
}
