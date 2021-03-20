export async function sleep(waitTime: number) {
    if (waitTime <= 0) { return; }
    await new Promise(r => setTimeout(r,waitTime));
}