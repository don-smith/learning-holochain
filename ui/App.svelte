<script>
  let greeting = ''
  function handleClick () {
    greeting = 'Hello from Svelte'
  }
</script>
<div>
  <button on:click={handleClick}>Say hello</button>
  <p>Greeting: {greeting}</p>
</div>
