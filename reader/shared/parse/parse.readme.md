Put these special rules in between css comments, e.g.
/* @toggle */

or

/* @toggle-style ... begin
...
@end */


# @toggle:

@toggle sidebar #sidebar false
@toggle hide_pro_icons article:has(span.sr-only) false
args: caption, selector, initial

# @toggle-style:

@toggle-style sidebar style1 true begin
args: caption, styleId, initial

# @macro:

@macro 1 begin-dark

# @contains "Over de auteur" b
color: red;

# @redirect

@redirect selector
