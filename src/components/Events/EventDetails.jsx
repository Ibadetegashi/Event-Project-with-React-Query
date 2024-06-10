import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: event,
    isError,
    error,
  } = useQuery({
    queryKey: ["event", { id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: deletingError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleCancelDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id });
  }
  let content;
  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            "Failed to fetch event data, please try again later."
          }
        />
      </div>
    );
  }

  if (event) {
    const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    content = (
      <>
        <header>
          <h1>{event.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${event.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{event.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {event.time}
              </time>
            </div>
            <p id="event-details-description">{event.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleCancelDelete}>
          <h2>Are you sure you want to delete this event?</h2>
          <p>This action cannot be undone!!</p>

          <div className="form-actions">
            {isPendingDeletion && <p>Deleting event...</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleCancelDelete} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeletion && (
            <ErrorBlock
              title="Failed to delete Event"
              message={deletingError.info?.message || "Error deleting"}
            />
          )}
        </Modal>
      )}

      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
