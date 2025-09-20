// Placeholder heuristic implementation until model integration.
export function extractTaskDrafts(message, opts = {}) {
    const { maxDrafts = 3, confidenceFloor = 0.2 } = opts;
    const sentences = message.content.split(/(?<=[.!?])\s+/).slice(0, 5);
    const drafts = [];
    for (const s of sentences) {
        const maybe = toDraft(s.trim());
        if (maybe && maybe.confidence >= confidenceFloor)
            drafts.push(maybe);
        if (drafts.length >= maxDrafts)
            break;
    }
    return { drafts };
}
function toDraft(sentence) {
    if (!sentence)
        return null;
    const lower = sentence.toLowerCase();
    const taskVerbs = ['create', 'write', 'draft', 'plan', 'schedule', 'refactor', 'update', 'fix', 'investigate'];
    if (!taskVerbs.some(v => lower.startsWith(v)))
        return null;
    const title = sentence.replace(/^[A-Z][a-z]+:\s*/, '').slice(0, 120);
    return {
        title,
        description: sentence.length > 120 ? sentence : undefined,
        confidence: 0.4 // static heuristic
    };
}
