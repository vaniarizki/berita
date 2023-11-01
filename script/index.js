const RSS_URL = [
  "https://www.antaranews.com/rss/ekonomi",
  "https://www.cnnindonesia.com/nasional/rss",
  "https://rss.detik.com/index.php/detikcom_nasional",
  "https://www.vice.com/id_id/rss"
]
const feedArea = document.getElementById("feedArea")

const newsItem = (owner, title, description, link) => `
<div class="col-sm-4 container p-3 my-3 border">
  <a href=${link}>
  <div class="owner text-info">${owner}</div>
    <div class="card-body ">
      <h4 class="card-title">${title}</h4>
      <hr/>
      <p class="card-text">${description}</p>
    </div>
  </a>
</div>
`

const loadFromXML = (rootEl, url = []) =>
  Promise.all(
    url.map(url => {
      fetch(url)
        .then(response => response.text())
        .then(str => {
          let xml = new window.DOMParser().parseFromString(str, "application/xml")
          return xml
        })
        .then(xml => {
          let html = ``
          if (xml.evaluate) {
            let items = xml.evaluate("/rss/channel/item", xml, null, XPathResult.ANY_TYPE, null)
            let owners = xml.evaluate("/rss/channel/title", xml, null, XPathResult.ANY_TYPE, null)
            let item = items.iterateNext()
            let owner = owners.iterateNext()
            while (item && owner) {
              ownerName = owner.textContent
              title = item.querySelector("title").textContent
              description = item.querySelector("description").textContent
              link = item.querySelector("link").textContent
              html += newsItem(ownerName, title, description, link)
              item = items.iterateNext()
            }
            rootEl.innerHTML += html
          }
        })
    })
  )

const loadFromJSON = (rootEl, url = []) =>
  Promise.all(
    url.map(url => {
      fetch(url)
        .then(response => response.text())
        .then(text => xmlToJson(text))
        .then(json => JSON.parse(json))
        .then(data => {
          let html = ``
          let items = data.rss.channel.item
          let owner = data.rss.channel.title
          items.map(item => {
            if (typeof item.title == "string") {
              title = item.title
            } else {
              title = item.title["#cdata-section"]
            }
            if (typeof item.description == "string") {
              description = item.description
            } else {
              description = item.description["#cdata-section"]
            }
            link = item.link
            html += newsItem(owner, title, description, link)
          })
          rootEl.innerHTML += html
        })
    }
    )
  )

const toggleXMLorJSON = () => {
  document.getElementById("json-btn").classList.toggle("active")
  document.getElementById("xml-btn").classList.toggle("active")
}

document.getElementById("json-btn").addEventListener("click", () => {
  if (!(document.getElementById("json-btn").classList.contains("active"))) {
    toggleXMLorJSON()
  }
  feedArea.innerHTML = ""
  loadFromJSON(feedArea, RSS_URL)
})

document.getElementById("xml-btn").addEventListener("click", () => {
  if (!(document.getElementById("xml-btn").classList.contains("active"))) {
    toggleXMLorJSON()
  }
  feedArea.innerHTML = ""
  loadFromXML(feedArea, RSS_URL)
})

loadFromXML(feedArea, RSS_URL)


