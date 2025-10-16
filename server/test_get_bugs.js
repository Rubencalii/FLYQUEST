async function run(){
  try{
    const res = await fetch('http://localhost:4000/api/flyquest/bugs', { headers: { 'x-admin-token': 'admin_secret_token' } })
    const json = await res.json()
    console.log('status', res.status, json)
  }catch(e){
    console.error('err', e)
  }
}

run()
