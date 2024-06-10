import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const {
    data: event,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["event", { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const {
    mutate,
    isPending: isPendingUpdate,
    errorUpdate,
    isError: isErrorUpdate,
  } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      //this data is coming from  mutate({ event: formData, id: params.id });
      await queryClient.cancelQueries({
        queryKey: ["event", { id: params.id }],
      });
      const prevEvent = queryClient.getQueryData(["event", { id: params.id }]);

      queryClient.setQueryData(["event", { id: params.id }], data.event); //will be set this data, without waiting for response
      return { prevEvent }; //the context in onError
    },
    onError: (data, error, context) => {
      queryClient.setQueryData(["event", { id: params.id }], context.prevEvent); //rolling back if req fails
    },
    onSettled: () => {
      queryClient.invalidateQueries(["event", { id: params.id }]); //will be always be executed after onMutate
    },
  });
  console.log(event);

  function handleSubmit(formData) {
    mutate({ event: formData, id: params.id });
    handleClose();
  }

  function handleClose() {
    navigate("../");
  }
  let content;
  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }
  if (isError) {
    content = (
      <>
        <ErrorBlock />
        <div className="form-actions">
          <Link to="../">Okay</Link>
        </div>
      </>
    );
  }
  if (event) {
    content = (
      <EventForm inputData={event} onSubmit={handleSubmit}>
        {isErrorUpdate && (
          <ErrorBlock
            title="Error while updating event"
            message={errorUpdate.info?.message || "Failed updating event"}
          />
        )}
        {isPendingUpdate && <p>Updating event</p>}
        {!isPendingUpdate && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }
  return <Modal onClose={handleClose}>{content}</Modal>;
}
