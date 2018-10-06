import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import './App.css';

const GET_BOOKS = gql`
  query {
    books {
      title
      author
    }
  }
`;

const ADD_BOOK = gql`
  mutation {
    addBook(title: "Never Show Up On Time For Work", author: "Mini Pekka") {
      title
      author
    }
  }
`;

const BOOKS_SUBSCRIPTION = gql`
  subscription {
    bookAdded {
      title
      author
    }
  }
`;

class BookList extends Component {
  componentDidMount() {
    this.props.subscribeToNewBooks();
  }

  render() {
    const { books } = this.props;

    return (
      <div>
        {books.map((book, index) => (
          <div key={index}>{`${book.title} - ${book.author}`}</div>
        ))}
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <Query query={GET_BOOKS}>
          {({ data, loading, subscribeToMore }) => {
            if (loading) {
              return null;
            }

            return (
              <BookList
                books={data.books}
                subscribeToNewBooks={() => {
                  subscribeToMore({
                    document: BOOKS_SUBSCRIPTION,
                    // [updateQuery]: An optional function that runs every time the server sends an update. This modifies the results of the HOC query.
                    // The first argument, previousResult, will be the previous data returned by the query you defined in your graphql() function.
                    // The second argument is an object with two properties. subscriptionData is result of the subscription.
                    // variables is the variables object used with the subscription query. Using these arguments
                    // you should return a new data object with the same shape as the GraphQL query you defined in your graphql() function. This is similar to the fetchMore callback.
                    updateQuery: (prev, { subscriptionData }) => {
                      if (!subscriptionData.data) return prev;
                      const newBook = subscriptionData.data.bookAdded;

                      return Object.assign({}, prev, {
                        books: [...prev.books, newBook],
                      });
                    },
                  });
                }}
              />
            );
          }}
        </Query>
        <Mutation
          mutation={ADD_BOOK}
          // We don't have to update the cache as it is already done on the above subscription part
        >
          {(addBook, { loading }) => {
            return (
              <button
                onClick={() => {
                  addBook();
                }}
              >
                Add Book
              </button>
            );
          }}
        </Mutation>
      </div>
    );
  }
}

export default App;
