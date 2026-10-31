    // Only 1→2→3→4→1 is plotted. The cursor waits at state 1 during gas exchange.
    const plot={x:lw+(narrow?25:40),y:48,w:w-lw-(narrow?62:84),h:h-112};
    window.PraxisIdealCycleDiagram.draw(ctx,plot,{kind:S.mode,cycle:m.cycle,phase:state.phase>=1&&state.phase<=4?state.phase-1:-1,fraction:state.fraction,area:S.t.area,mark:true});
