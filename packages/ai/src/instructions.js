export function mergeInstructionLayers(layers) {
    // Sort strategy: global first, then project, then ephemeral (stable within each)
    const ordered = [...layers].sort((a, b) => rank(a) - rank(b));
    const systemPrompt = ordered.map(l => formatLayer(l)).join('\n\n');
    return { systemPrompt, layers: ordered };
}
function rank(layer) {
    if (layer.id === 'global')
        return 0;
    if (layer.id.startsWith('project:'))
        return 1;
    return 2; // ephemeral context
}
function formatLayer(layer) {
    return `# ${layer.id}\n${layer.content.trim()}`;
}
