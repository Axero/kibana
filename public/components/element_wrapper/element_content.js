/*
  This feels like a crummy hack but I need a way to make sure that Positionable is able to pass the
  size property all the way down to RenderElement.

  Positionable keeps size as local state because constantly pushing it through redux is too expensive,
  thus size is coming in via a child clone in Positionable. Gross right?
*/

import React from 'react';
import PropTypes from 'prop-types';
import { InvalidExpression } from './invalid_expression';
import { InvalidElementType } from './invalid_element_type';
import { Loading } from '../loading';
import { pure, compose, branch, renderComponent } from 'recompose';
import { RenderElement } from '../render_element';

/*
  Branches
  Short circut rendering of the element if the element isn't ready or isn't valid.
*/
const loadingBranch = branch(({ renderable, state }) => {
  // no renderable or renderable config value
  return !state || !renderable;
}, renderComponent(Loading));

const invalidRenderTypeBranch = branch(({ renderable, elementTypeDefintion }) => {
  // renderable is available, but no matching element is found
  return (renderable && renderable.type !== 'render' && !elementTypeDefintion);
}, renderComponent(InvalidElementType));

const invalidExpressionBranch =  branch(({ renderable, elementTypeDefintion, state }) => {
  // Show an error if...
  return (
    state === 'error' || // The renderable has an error
    renderable.type !== 'render' || // The renderable isn't, well, renderable
    !elementTypeDefintion // We can't find an element in the registry for this
  );
}, renderComponent(InvalidExpression));

export const ElementContent = compose(
  pure,
  loadingBranch,
  invalidRenderTypeBranch,
  invalidExpressionBranch
)(({ elementTypeDefintion, renderable, size }) => {
  return (
    <RenderElement
      renderFn={elementTypeDefintion.render}
      config={renderable.value}
      done={() => {}}
      size={size}
    />
  );
});

ElementContent.propTypes = {
  elementTypeDefintion: PropTypes.object,
  renderable: PropTypes.object,
  state: PropTypes.string,
  size: PropTypes.object,
};
