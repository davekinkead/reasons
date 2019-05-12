---
title: 'Reasons: A digital argument mapping library for modern browsers'
tags: [argument mapping, critical thinking, pedagogy]
authors:
  - name: Dave Kinkead
    email: d.kinkead@uq.edu.au
    orcid: 0000-0001-5396-8099
    affiliation: 1
  - name: Deborah Brown
    email: deborah.brown@uq.edu.au
    orcid: 0000-0001-5707-7605
    affiliation: 1
  - name: Peter Ellerton
    email: peter.ellerton@uq.edu.au
    orcid: 0000-0002-6588-376X
    affiliation: 1
  - name: Claudio Mazzola
    email: c.mazzola@uq.edu.au
    orcid: 0000-0001-6117-7465           
    affiliation: 1
affiliations:
  - name: University of Queensland Critical Thinking Project
    index: 1
date: 25 September 2018
bibliography: paper.bib
---

# Summary

There is growing recognition globally of the need to teach Critical Thinking as part of formal schooling and of its importance to the “knowledge economies” of the future.  Yet international research demonstrates that without explicit instruction in critical thinking, undergraduate education often results in little to no gains in critical thinking, analytic reasoning, and other "higher level" skills [@harrell2004improvement, @arum2011academically]. 

One very effective way to improving critical thinking is through argument mapping — the visual representation of an argument’s logical structure.  Argument mapping in paper form is common in philosophy courses and has a pedagogical pedigree that can be traced back to Wigmore [@wigmore1913principles], Toulmin [@toulmin2003uses], and Govier [@govier1992good].  Argument mapping can improve critical thinking skills by offering students an opportunity to engage in _metacogntive evaluation_ -  evaluating the quality of their own, and other's, reasoning.

Digital argument mapping as an educational tool has been validated by van Gelder [@van2002argument], Butchart et al [@butchart2009improving], and Mulnix [@mulnix2012thinking]. Dwyer, Hogan, & Stewart [dwyer2012evaluation] demonstrated that argument mapping improves concept recall compared with textual analysis; Twardy [twardy2004argument: p2] that it produces cognitive gains three times that of other methods; and van Gelder [@vangelder_2005 :45] that the cognitive gains from one semester of explicit argument mapping are equivalent to that of an entire undergraduate degree.  

Unfortunately, argument mapping is rarely used outside of philosophy classes owing either to a lack of instructor expertise or availability of tools appropriate to non-philosophical pedagogies.  Current digital argument mapping tools are either desktop software, limiting their ability to be integrated into online courseware, or propriety and tighly coupled, limiting their access and extensibility.

`Reasons` seeks to bridge this gap by offering an open-source, loosely-coupled, web-based argument mapping library that can be integrated into a range of online coursewares and websites.  The javascript library can be embedded into any HTML page and allows users to create, edit, share, and export argument maps (see https://reasons.io for an example).  The API is designed to permit the integration of the three stages of informal logical analysis -- identification of truth claims within arguments, the analysis of logical structure, and synthesis of logcial structure into writen form.

Development has been funded by a University of Queensland Teaching Innovation Grant and the software forms a key component of the UQ Critical Thinking Project's research program into digital and critical thinking pedagogies.  The intended audience for this software includes education researchers and practitions in secondary and higher education.  It can be used in either library or hosted form:

  - `Reasons.js`: a javascript library for digital argument mapping (https://github.com/davekinkead/reasons)

  - `Reasons.io`: a hosted argument mapping platform using `reasons.js` (http://reasons.io)



# References
