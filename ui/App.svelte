<script>
  import Buffer from 'buffer'
  import { AppWebsocket } from '@holochain/conductor-api'

  window.Buffer = Buffer.Buffer

  let greeting = ''

  function handleClick () {
    getGreeting()
  }

  async function getGreeting () {
    const appConnection = await AppWebsocket.connect('ws://localhost:8888')
    const appInfo = await appConnection.appInfo({ installed_app_id: 'test-app' })
    const cellId = appInfo.cell_data[0].cell_id

    const message = await appConnection.callZome({
     cap: null,
     cell_id: cellId,
     zome_name: 'greeter',
     fn_name: 'hello',
     provenance: cellId[1],
     payload: null,
    })

    greeting = message
  }
</script>
<div>
  <button on:click={handleClick}>Say hello</button>
  <p>Greeting: {greeting}</p>
</div>
