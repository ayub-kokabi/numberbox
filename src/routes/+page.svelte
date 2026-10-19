<script>
	let phone = $state('');
	let loading = $state(false);
	let error = $state('');
	let result = $state(/** @type {any} */ (null));

	function sanitize(v) {
		const digitsPlus = v.replace(/[^\d+]/g, '');
		const leadingPlus = digitsPlus.startsWith('+');
		const digits = digitsPlus.replace(/\+/g, '');
		return (leadingPlus ? '+' : '') + digits;
	}

	async function search() {
		error = '';
		result = null;
		const cleaned = phone.trim();

		if (!cleaned.startsWith('+')) {
			error = 'Phone must include country code (e.g. +14155552671)';
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone: cleaned })
			});
			const data = await res.json();
			if (!res.ok || !data.status) {
				error = data.error || 'No results';
			} else {
				result = data;
			}
		} catch {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}

	function onSubmit(e) {
		e.preventDefault();
		if (!loading) search();
	}

	function onPhoneInput(e) {
		const cleaned = sanitize(e.currentTarget.value);
		phone = cleaned;
		if (e.currentTarget.value !== cleaned) {
			e.currentTarget.value = cleaned;
		}
	}

	function isPersian(s) {
		return /[\u0600-\u06FF]/.test(s || '');
	}
</script>

<main class="page">
	<div class="container">
		<header class="header">
			<h1 class="title">NumberBox</h1>
			<p class="subtitle">Look up names saved by others for a phone number</p>
		</header>

		<form onsubmit={onSubmit} class="form">
			<input
				type="tel"
				inputmode="tel"
				value={phone}
				oninput={onPhoneInput}
				placeholder="+14155552671"
				class="input"
				disabled={loading}
				autocomplete="off"
				spellcheck="false"
				maxlength="16"
			/>
			<button type="submit" disabled={loading || !phone.trim()} class="button">
				{loading ? 'Searching…' : 'Search'}
			</button>
		</form>		

		{#if error}
			<div class="error">{error}</div>
		{/if}

		{#if result}
			<div class="results">
				<div class="result-input">{result.input}</div>
				{#if result.result?.length}
					<ul class="list">
						{#each result.result as r}
							{@const fullName = [r.name, r.last_name].filter(Boolean).join(' ').trim()}
							{@const isFa = isPersian(fullName)}
							<li class="item" dir={isFa ? 'rtl' : 'ltr'}>
								<span class={isFa ? 'name fa' : 'name'}>{fullName}</span>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="empty">No results</div>
				{/if}
			</div>
		{/if}
	</div>
</main>

<style>
	.page {
		min-height: 100vh;
		background: #0a0a0a;
		color: #e5e5e5;
		font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 4rem 1rem;
	}
	.container {
		width: 100%;
		max-width: 32rem;
	}
	.header {
		margin-bottom: 2rem;
	}
	.title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		letter-spacing: -0.02em;
	}
	.subtitle {
		font-size: 0.875rem;
		color: #737373;
		margin: 0;
	}
	.form {
		display: flex;
		gap: 0.5rem;
	}
	.input {
		flex: 1;
		background: #171717;
		border: 1px solid #262626;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		color: #e5e5e5;
		font-family: inherit;
		font-size: 0.9375rem;
		outline: none;
		transition: border-color 0.15s ease;
	}
	.input:focus {
		border-color: #525252;
	}
	.input:disabled {
		opacity: 0.5;
	}
	.input::placeholder {
		color: #525252;
	}
	.button {
		background: #e5e5e5;
		color: #0a0a0a;
		border: none;
		border-radius: 0.5rem;
		padding: 0.75rem 1.25rem;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}
	.button:hover:not(:disabled) {
		opacity: 0.85;
	}
	.button:disabled {
		background: #262626;
		color: #525252;
		cursor: not-allowed;
	}
	.hint {
		margin: 0.75rem 0 0 0;
		font-size: 0.75rem;
		color: #525252;
	}
	.hint code {
		background: #171717;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: inherit;
		color: #a3a3a3;
	}
	.error {
		margin-top: 1.5rem;
		font-size: 0.875rem;
		color: #f87171;
	}
	.results {
		margin-top: 2rem;
	}
	.result-input {
		font-size: 0.75rem;
		color: #525252;
		margin-bottom: 0.75rem;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.item {
		background: #171717;
		border: 1px solid #262626;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
	}
	.name {
		font-weight: 500;
		font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
	}
	.fa {
		font-family: 'Vazir Code', 'JetBrains Mono', ui-monospace, monospace;
	}
	.empty {
		text-align: center;
		color: #525252;
		font-size: 0.875rem;
		padding: 1rem;
	}
</style>