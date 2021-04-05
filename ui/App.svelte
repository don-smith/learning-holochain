<script>
  import { AppWebsocket } from '@holochain/conductor-api'

  let greeting = ''
  const timeout = 12000

  function handleClick () {
    console.log('handling the click')
    getGreeting()
  }

  async function getGreeting () {
    const client = await AppWebsocket.connect('ws://localhost:8888', timeout, signalCb)

    console.log('got here')

    await client.callZome({
     cap: null,
     cell_id: [
       'uhC0k4QpaOlFB3A5xZoT3m4C7jA2juCxpQtNAZwg2HEoRr7r-wcix'.split(''),
       'uhCAkMSUebo8J45NgrKgO--oDEVDBYuW2rhr_1rq8wDLR-v_90PK'.split('')
     ],
     zome_name: 'greeter',
     fn_name: 'hello',
     provenance: 'uhCAkMSUebo8J45NgrKgO--oDEVDBYuW2rhr_1rq8wDLR-v_90PK'.split(''),
     payload: null,
    }, timeout)
  }

  function signalCb (signal) {
    console.log('signal:', signal)
    greeting = 'Hello from Svelte'
  }

    function makeBuffer (str) {
      return str.split('')
    }
</script>
<div>
  <button on:click={handleClick}>Say hello</button>
  <p>Greeting: {greeting}</p>
</div>
