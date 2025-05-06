<script lang="ts">
	import { PUBLIC_VAPI_ASSISTANT_ID, PUBLIC_VAPI_KEY } from '$env/static/public';
	import { onMount } from 'svelte';
	import Vapi from '@vapi-ai/web';

	let vapi: Vapi;
	type CallStatus = 'pending' | 'preparing' | 'ongoing' | 'terminated';
	let callStatus: CallStatus = $state('pending');

	onMount(() => {
		vapi = new Vapi(PUBLIC_VAPI_KEY);

		vapi.on('call-start', () => {
			callStatus = 'ongoing';
		});

		vapi.on('call-end', () => {
			callStatus = 'terminated';
		});
	});

	async function toggleAssistant() {
		if (callStatus === 'pending') {
			callStatus = 'preparing';
			try {
				await vapi.start(PUBLIC_VAPI_ASSISTANT_ID);
			} catch (e: unknown) {
				console.error(e);
				callStatus = 'pending';
			}
		} else if (callStatus === 'ongoing') vapi.stop();
	}
</script>

<main>
	<h1 class="mt-36 text-center text-5xl font-bold">Vapi + Slack Integration Demo</h1>
	<button
		class="{callStatus === 'ongoing'
			? 'bg-red-700'
			: 'bg-blue-700'} mx-auto mt-12 block cursor-pointer rounded-full px-6 py-2 text-lg font-semibold text-slate-200 disabled:cursor-default disabled:bg-blue-700/60"
		disabled={callStatus === 'preparing' ? true : false}
		onclick={toggleAssistant}
		>{callStatus === 'ongoing' ? 'Get me out of here' : "I'm ready for the interview"}</button
	>
</main>
