# Consistent Colors

When you have a large number of different entities to visualize, it isn't feasible to predefine
which color each entity gets. One option is to assign color based on the order of the entities
currently being shown, but this means that in different contexts a given entity will have a 
different color representing it.

To get around this, we can hash the ID of the entity to map it to a color from a bucket of colors.
This ensures that each time we are visualizing that entity, it gets the same color. However, since
we are using a hash, we are likely to run into collisions. To overcome this limitation, we can 
vary the lightness of entities that hash to the same color if they are being requested to be
visualized together.

Consistent Colors tries to solve this problem. It provides an interface to play around with different
hash functions and sets of colors while demonstrating how varying of color happens when two entities
get mapped to the same color.
