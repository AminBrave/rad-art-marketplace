const avatarTones = ['bg-[color:color-mix(in_srgb,var(--color-sand)_65%,transparent)] text-ink', 'bg-[color:color-mix(in_srgb,var(--color-olive)_10%,transparent)] text-olive', 'bg-[color:color-mix(in_srgb,var(--color-terracotta)_10%,transparent)] text-terracotta-strong', 'bg-surface-muted text-ink'];

export function avatarTone(name) {
    const value = String(name ?? 'گفتگو').trim();
    return avatarTones[(value.codePointAt(0) ?? 0) % avatarTones.length];
}

export function avatarInitial(name) {
    return String(name ?? 'گ').trim().slice(0, 1) || 'گ';
}
