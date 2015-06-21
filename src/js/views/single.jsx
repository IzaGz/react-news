'use strict';

var Reflux = require('reflux');
var SingleStore = require('../stores/SingleStore');
var Actions = require('../actions/Actions');
var Spinner = require('../components/Spinner');
var Post = require('../components/Post');
var Comment = require('../components/Comment');
var Router = require('react-router');

var pluralize = require('../util/pluralize');

var SinglePost = React.createClass({

    propTypes: {
        user: React.PropTypes.object,
        params: React.PropTypes.object
    },

    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(SingleStore, 'onUpdate')
    ],

    statics: {
        willTransitionTo(transition, params) {
            // watch current post and comments
            Actions.listenToPost(params.postId);
        },

        willTransitionFrom(transition, component) {
            Actions.stopListeningToPost(component.state.post.id);
        }
    },

    getInitialState() {
        return {
            post: false,
            comments: [],
            loading: true
        };
    },

    onUpdate(postData) {
        this.setState({
            post: postData.post,
            comments: postData.comments,
            loading: false
        });
    },

    addComment(e) {
        e.preventDefault();

        if (!this.props.user.isLoggedIn) {
            Actions.showModal('login');
            return;
        }

        var commentTextEl = this.refs.commentText.getDOMNode();
        var comment = {
            postId: this.props.params.postId,
            postTitle: this.state.post.title,
            text: commentTextEl.value.trim(),
            creator: this.props.user.profile.username,
            creatorUID: this.props.user.uid,
            time: Date.now()
        };
        Actions.addComment(comment);
        commentTextEl.value = '';
    },

    render() {
        var user = this.props.user;
        var comments = this.state.comments;
        var post = this.state.post;
        var postId = this.getParams();
        var content;

        if (this.state.loading) {
            content = <Spinner />;
        // } else if (post.isDeleted) {
        //     this.replaceWith('404');
        } else {
            comments = comments.map(function(comment) {
                return <Comment comment={ comment } user={ user } key={ comment.id } />;
            });
            content = (
                <div>
                    <Post post={ post } user={ user } key={ postId } />
                    <div className="comments">
                        <h2>{ pluralize(comments.length, 'Comment') }</h2>
                        { comments }
                    </div>
                </div>
            );
        }

        return (
            <div className="content full-width">
                { content }
                <form className='comment-form' onSubmit={ this.addComment }>
                    <textarea placeholder="Post a Comment" ref="commentText" className="comment-input full-width"></textarea>
                    <button type="submit" className="button button-primary">Submit</button>
                </form>
            </div>
        );
    }

});

module.exports = SinglePost;
