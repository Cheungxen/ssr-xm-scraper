const Koa = require('koa')
const axios = require('axios')
const cheerio = require('cheerio')

const app = new Koa()

app.use(async (ctx, next) => {
  const { status, data } = await axios.get('https://www.mi.com/')
  const $ = cheerio.load(data)

  // topBar 菜单数据
  const topBarData = []
  $('.site-topbar .topbar-nav a').each((idx, item) => {
    topBarData[idx] = $(item).text()
  })

  // 导航数据
  // {
  //  '小米手机': [{...},{...}],
  //  ...
  // }
  const navData = []
  $('.site-header .nav-list .nav-item').each((idx, item) => {
    const title = $(item).find('.link .text').text()
    const items = []
    $(item).find('.item-children .children-list li').each((idx, item) => {
      const tempObj = {
        title: $(item).find('.title a').text(),
        price: $(item).find('.price').text(),
        flags: $(item).find('.flags .flag').text(),
        img: $(item).find('.figure img').attr('data-src')
      }
      items.push(tempObj)
    })
    const temp = {
      title: title,
      items: items
    }
    navData.push(temp)
  })

  // 轮播图数据
  const slider = []
  $('#J_homeSlider .slide').each((idx, item) => {
    idx === 0
      ? slider[idx] = $(item).find('img').attr('src')
      : slider[idx] = $(item).attr('data-bg-set').match(/\/\/.*?jpg/)[0]
  })

  // 轮播图下方图片
  const sliderBottomImgs = []
  $('#J_homePromo img').each((idx, item) => {
    sliderBottomImgs[idx] = $(item).attr('src')
  })

  // 广告横幅
  const adImgs = 'Vue动态渲染的'

  // 所有分类，菜单数据
  const { status: status1, data: data1 } = await axios.get('http://list.mi.com/')
  const $1 = cheerio.load(data1)

  const menuData = []
  $1('.container.J_category .category-list').each((idx, item) => {
    const title = $1(item).find('.title').text()
    const tempArr = []
    $1(item).find('li').each((idx, item) => {
      const tempObj = {
        title: $1(item).find('.category-list-title').text(),
        img: $1(item).find('img').attr('src'),
        url: $1(item).find('.category-list-title').attr('href')
      }
      tempArr[idx] = tempObj
    })
    const tempObj = {
      title: title,
      data: tempArr
    }
    menuData.push(tempObj)
  })

  ctx.response.type = 'text/json'
  ctx.response.body = {
    topBarData,
    navData,
    slider,
    sliderBottomImgs,
    adImgs,
    menuData
  }
})

// 在端口3000监听:
app.listen(3000)
console.log('app started at port 3000...')
