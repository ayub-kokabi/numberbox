<script>
	import { onMount } from 'svelte';

	let showModal = $state(false);
	let accepted = $state(false);
	let phone = $state('');
	let loading = $state(false);
	let error = $state('');
	let result = $state(/** @type {any} */ (null));
	let inputElement = $state(null);
	let runId = $state(0);

	onMount(() => {
		if (!localStorage.getItem('nb_demo_ack')) {
			showModal = true;
		} else if (inputElement) {
			inputElement.focus();
		}
	});

	function confirmAck() {
		if (!accepted) return;
		localStorage.setItem('nb_demo_ack', '1');
		showModal = false;
		if (inputElement) inputElement.focus();
	}

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
				runId++;
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

{#if showModal}
	<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="demo-title">
		<div class="modal" dir="rtl">
			<h2 id="demo-title" class="modal-title">توضیح</h2>

			<div class="modal-body">
				<p>
					این سایت برای استفادهٔ عمومی طراحی نشده و صرفاً نسخه‌ای زنده از سورس پروژه برای
					نمایش عملکرد صحیح ارتباط
					با سرور نامبرباکس در غیاب اپلیکیشن رسمی آن است؛ هدف این بوده که پیش از دریافت سورس پروژه، از عملکرد درست آن
					اطمینان حاصل کنید.
				</p>

				<p>
					نامعتبر بودن برخی پاسخ‌ها، مسئله‌ای مجزا از هدف اصلی پروژه است و دلیل آن نیز مشخص است: حجم بالای
					درخواست‌های ارسالی از IPهای زیرساخت کلادفلر، حساسیت سرور مقصد را برانگیخته و
					باعث تولید پاسخ‌های بی‌ربط به‌عنوان یک اقدام امنیتی شده است.
				</p>

				<p>
					برای ارزیابی دقیق‌تر و کاهش احتمال دریافت پاسخ‌های نامعتبر، پروژه را به‌صورت
					لوکال اجرا کنید و درخواست‌ها را به‌شکل کنترل‌شده از طریق VPN اختصاصی ارسال
					کنید. قابل ذکر است حتی در این شرایط نیز دریافت پاسخ‌های معتبر تضمین‌شده نیست و ممکن
					است محدودیت‌های سمت سرور اعمال شود، همچنان که در اپلیکیشن رسمی نیز این
					موضوع وجود دارد.
				</p>
			</div>

			<label class="modal-check">
				<span>متوجه هستم</span>
				<input type="checkbox" bind:checked={accepted} />
			</label>

			<button class="modal-btn" disabled={!accepted} onclick={confirmAck}>تأیید</button>
		</div>
	</div>
{/if}

<main class="layout" class:blurred={showModal}>
	<header class="header">
		<h1 class="title">NumberBox</h1>
		<p class="subtitle">Look up names saved by others for a phone number</p>
	</header>

	<section class="panel">
		<form onsubmit={onSubmit} class="form">
			<div class="input-wrapper">
				<input
					bind:this={inputElement}
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
				{#if loading}
					<span class="spinner" aria-label="Loading"></span>
				{/if}
			</div>
			<button type="submit" disabled={loading || !phone.trim()} class="button">
				{loading ? 'Searching…' : 'Search'}
			</button>
		</form>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<a
			href="https://github.com/ayub-kokabi/numberbox"
			target="_blank"
			rel="noopener noreferrer"
			class="source-link"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.69-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"
				/>
			</svg>
			<span>Source on github</span>
		</a>
	</section>

	<section class="results-panel">
		{#key runId}
			{#if result}
				<div class="results">
					{#if result.result?.length}
						<ul class="list">
							{#each result.result as r, i}
								{@const fullName = [r.name, r.last_name].filter(Boolean).join(' ').trim()}
								{@const isFa = isPersian(fullName)}
								<li
									class="item"
									dir={isFa ? 'rtl' : 'ltr'}
									style="animation-delay: {i * 25}ms"
								>
									<span class={isFa ? 'name fa' : 'name'}>{fullName}</span>
								</li>
							{/each}
						</ul>
					{:else}
						<div class="empty-box">
							<div class="empty-title">No results</div>
							<div class="empty-sub">Try again with a different number</div>
						</div>
					{/if}
				</div>
			{/if}
		{/key}
	</section>
</main>

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 100;
	}
	.modal {
		background: #111;
		border: 1px solid #262626;
		border-radius: 0.75rem;
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		padding: 2rem;
		font-family: 'Vazir Code', 'JetBrains Mono', ui-monospace, monospace;
		color: #e5e5e5;
	}
	.modal-title {
		margin: 0 0 1.25rem 0;
		font-size: 1.125rem;
		font-weight: 700;
		text-align: right;
	}
	.modal-body {
		font-size: 0.8125rem;
		line-height: 1.9;
		color: #a3a3a3;
		text-align: justify;
	}
	.modal-body p {
		margin: 0 0 1rem 0;
	}
	.modal-check {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 1.5rem 0 1rem 0;
		font-size: 0.8125rem;
		color: #e5e5e5;
		cursor: pointer;
		flex-direction: row-reverse;
		justify-content: flex-end;
	}
	.modal-check input {
		width: 16px;
		height: 16px;
		accent-color: #e5e5e5;
		cursor: pointer;
	}
	.modal-btn {
		width: 100%;
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
	.modal-btn:hover:not(:disabled) {
		opacity: 0.85;
	}
	.modal-btn:disabled {
		background: #262626;
		color: #525252;
		cursor: not-allowed;
	}
	.blurred {
		filter: blur(3px);
		pointer-events: none;
		user-select: none;
	}

	.layout {
		min-height: 100vh;
		background: #0a0a0a;
		color: #e5e5e5;
		font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
		display: grid;
		grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
		grid-template-areas:
			'header .'
			'panel results';
		column-gap: 1rem;
		row-gap: 1rem;
		align-items: start;
		align-content: start;
		max-width: 1200px;
		margin: 0 auto;
		padding: 4rem 1rem 2rem;
	}
	.header {
		grid-area: header;
		max-width: 420px;
		margin: 0;
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
	.panel {
		grid-area: panel;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 420px;
	}
	.form {
		display: flex;
		gap: 0.5rem;
	}
	.input-wrapper {
		position: relative;
		flex: 1;
	}
	.input {
		width: 100%;
		background: #171717;
		border: 1px solid #262626;
		border-radius: 0.5rem;
		padding: 0.75rem 2.5rem 0.75rem 1rem;
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
	.spinner {
		position: absolute;
		right: 0.85rem;
		top: 50%;
		width: 14px;
		height: 14px;
		border: 2px solid #262626;
		border-top-color: #e5e5e5;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		pointer-events: none;
	}
	@keyframes spin {
		from {
			transform: translateY(-50%) rotate(0deg);
		}
		to {
			transform: translateY(-50%) rotate(360deg);
		}
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
		transition:
			opacity 0.15s ease,
			transform 0.08s ease;
	}
	.button:hover:not(:disabled) {
		opacity: 0.85;
	}
	.button:active:not(:disabled) {
		transform: scale(0.97);
	}
	.button:disabled {
		background: #262626;
		color: #525252;
		cursor: not-allowed;
	}
	.error {
		font-size: 0.875rem;
		color: #f87171;
	}
	.source-link {
		font-size: 0.75rem;
		color: #525252;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		align-self: flex-start;
		transition: color 0.15s ease;
	}
	.source-link:hover {
		color: #e5e5e5;
	}
	.results-panel {
		grid-area: results;
		justify-self: start;
		width: 100%;
		max-width: 500px;
	}
	.results {
		width: 100%;
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
		animation: slideIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(16px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	.name {
		font-weight: 500;
		font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
	}
	.fa {
		font-family: 'Vazir Code', 'JetBrains Mono', ui-monospace, monospace;
	}
	.empty-box {
		background: #171717;
		border: 1px solid #262626;
		border-radius: 0.5rem;
		padding: 1.5rem;
		text-align: center;
		animation: slideIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	.empty-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #e5e5e5;
		margin-bottom: 0.375rem;
	}
	.empty-sub {
		font-size: 0.75rem;
		color: #737373;
	}
	@media (max-width: 768px) {
		.layout {
			grid-template-columns: 1fr;
			grid-template-areas:
				'header'
				'panel'
				'results';
			row-gap: 1.5rem;
			padding: 2rem 1rem;
		}
		.header {
			max-width: 100%;
		}
		.panel {
			max-width: 100%;
		}
		.results-panel {
			justify-self: stretch;
			max-width: 100%;
		}
		.modal {
			padding: 1.5rem;
		}
	}
</style>