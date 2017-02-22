module.exports = {

  //  transforms a graph {nodes: {}, edges: []} into a 
  //  hierarchically ordered array
  hierarchical: (graph) => {

    //  begin with the conclusion(s)
    let levels = []
    let current = graph.ends()

    //  get parents of each level of reasons
    while(current.length > 0) {
      levels.push(current)
      current = graph.parents(current)
    }

    //  finally add any orphans to the last layer
    let orphans = graph.orphans()
    if (orphans.length > 0) levels.push(orphans)

    return levels
  }
}