/**
 * WordPress dependencies
 */
import {
	createBlock,
	parseWithAttributeSchema,
	serialize,
} from '@wordpress/blocks';

const transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'core/group' ],
			transform: ( {}, innerBlocks ) =>
				createBlock( 'core/quote', {}, innerBlocks ),
		},
		{
			type: 'block',
			blocks: [ 'core/pullquote' ],
			transform: ( { value, citation } ) => {
				return createBlock(
					'core/quote',
					{
						attribution: citation,
					},
					parseWithAttributeSchema( value, {
						type: 'array',
						source: 'query',
						selector: 'p',
						query: {
							content: {
								type: 'string',
								source: 'text',
							},
						},
					} ).map( ( { content } ) =>
						createBlock( 'core/paragraph', { content } )
					)
				);
			},
		},
	],
	to: [
		{
			type: 'block',
			blocks: [ 'core/group' ],
			transform: ( { attribution }, innerBlocks ) =>
				createBlock(
					'core/group',
					{},
					attribution
						? [
								...innerBlocks,
								createBlock( 'core/paragraph', {
									content: attribution,
								} ),
						  ]
						: innerBlocks
				),
		},
		{
			type: 'block',
			blocks: [ 'core/pullquote' ],
			isMatch: ( attributes, block ) => {
				return block.innerBlocks.every(
					( { name } ) => name === 'core/paragraph'
				);
			},
			transform: ( { attribution }, innerBlocks ) => {
				return createBlock( 'core/pullquote', {
					value: serialize( innerBlocks ),
					citation: attribution,
				} );
			},
		},
	],
};

export default transforms;
