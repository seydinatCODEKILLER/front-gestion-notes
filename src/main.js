import './style.css'


document.querySelector('#app').innerHTML = `
  <div class="container mx-auto">
    <h1 class="text-3xl font-bold underline text-blue-500">
      Hello Vite + Tailwind CSS!
    </h1>
  </div>
`

setupCounter(document.querySelector('#counter'))
