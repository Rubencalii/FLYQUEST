async function run(){
  try{
    const res = await fetch('http://localhost:4000/api/flyquest/bugs', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title: 'Test bug', description: 'Error al cargar roster', url: 'http://localhost:3000', severity: 'high' })
    })
    const json = await res.json()
    console.log('status', res.status, json)
  }catch(e){
    console.error('err', e)
  }
}

run()
