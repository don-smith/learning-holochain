<script>
  import { AppWebsocket } from '@holochain/conductor-api'

  let greeting = ''

  async function handleClick () {
    const timeout = 12000
    const client = await AppWebsocket.connect('http://localhost:8888', timeout, signalCb)

    await client.callZome({
     cap: null,
     cell_id,
     zome_name: 'greeter',
     fn_name: 'hello',
     provenance: fakeAgentPubKey('TODO'),
     payload: null,
    }, timeout)

  }

  function signalCb (signal) {
    greeting = 'Hello from Svelte'
    resolve()
  }
</script>
<div>
  <button on:click={handleClick}>Say hello</button>
  <p>Greeting: {greeting}</p>
</div>
