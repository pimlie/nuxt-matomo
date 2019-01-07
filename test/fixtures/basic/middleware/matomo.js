export default ({ route }) => {
  if (route.name && !['index', 'injected'].includes(route.name)) {
    route.meta.matomo = {
      someVar1: ['setCustomVariable', 1, 'VisitorType', 'A', 'page'],
      someVar2: ['setCustomVariable', 2, 'OtherType', true, 'page']
    }
  }
}
